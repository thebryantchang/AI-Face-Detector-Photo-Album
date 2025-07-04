from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import insightface
import requests
import cv2
import numpy as np

MongoURI = "mongodb+srv://admin:12341234@cluster0.8wyl7.mongodb.net/"
client = MongoClient(MongoURI)
db = client["test"]
imagescollection = db["images"]
facescollection = db["faces"]

model = insightface.app.FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
model.prepare(ctx_id=0)

def compare_faces(embedding1, embedding2):
    """Compare two face embeddings using InsightFace's built-in method"""
    try:
        emb1 = np.array(embedding1)
        emb2 = np.array(embedding2)
        
        # Check if compute_sim exists, if not use dot product
        if hasattr(model, 'compute_sim'):
            similarity = model.compute_sim(emb1, emb2)
        else:
            # Fallback to dot product (InsightFace embeddings are normalized)
            similarity = np.dot(emb1, emb2)
        
        return float(similarity)
    except Exception as e:
        print(f"Error in compare_faces: {e}")
        # Fallback to simple dot product
        emb1 = np.array(embedding1)
        emb2 = np.array(embedding2)
        return float(np.dot(emb1, emb2))

def preprocess_face_for_embedding(img_bgr, face_bbox):
    """Extract and preprocess face region for better embedding"""
    x1, y1, x2, y2 = face_bbox.astype(int)
    
    # Add padding around face (helps with context)
    h, w = img_bgr.shape[:2]
    padding = 20
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding) 
    x2 = min(w, x2 + padding)
    y2 = min(h, y2 + padding)
    
    # Extract face region
    face_img = img_bgr[y1:y2, x1:x2]
    
    # Resize to standard size (helps with consistency)
    face_img = cv2.resize(face_img, (112, 112))
    
    return face_img

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/apiv2/test')
def home():
    return "Flask test succeeded"

@app.route('/apiv2/facefilter', methods=['POST'])
def face_filter():
    try:
        print("Face filter endpoint hit!")
        data = request.json
        print(f"Received data: {data}")
        
        url = data['url']
        threshold = data.get('threshold', 0.5)
        
        print(f"Processing image from URL: {url}")
        
        # Download and process the reference image
        resp = requests.get(url)
        img_arr = np.asarray(bytearray(resp.content), dtype=np.uint8)
        img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        
        print("Image downloaded and processed")
        
        # Get face embedding from reference image
        faces_analysis = model.get(img_bgr)
        print(f"Found {len(faces_analysis)} faces total")
        
        confident_faces = [face for face in faces_analysis if face.det_score > 0.5]
        print(f"Found {len(confident_faces)} confident faces")
        
        if not confident_faces:
            return jsonify({"error": "No face detected in reference image"}), 400
        
        # Use the best detected face (highest confidence)
        best_face = max(confident_faces, key=lambda x: x.det_score)
        print(f"Best face confidence: {best_face.det_score}")
        
        # Use original embedding (skip preprocessing for now to isolate the issue)
        reference_embedding = best_face.embedding.tolist()
        print(f"Got reference embedding of length: {len(reference_embedding)}")
        
        # Get all faces from database
        faces = list(facescollection.find({}))
        print(f"Found {len(faces)} faces in database")
        
        matches = []
        
        # Compare with all database faces
        for i, face in enumerate(faces):
            print(f"Comparing with face {i+1}/{len(faces)}")
            similarity = compare_faces(reference_embedding, face['embedding'])
            print(f"Similarity: {similarity}")
            
            if similarity > 100:
                matches.append({
                    "url": face['url'],
                    "similarity": similarity,
                    "box": face['box'],
                    "confidence": face['confidence']
                })
        
        # Sort matches by similarity (highest first) before deduplication
        matches.sort(key=lambda x: x['similarity'], reverse=True)
        
        # Remove duplicate URLs, keeping the first (highest similarity due to sorting)
        seen_urls = set()
        unique_matches = []
        for match in matches:
            if match['url'] not in seen_urls:
                seen_urls.add(match['url'])
                unique_matches.append(match)
        matches = unique_matches

        # Extract just URLs for simpler response
        matches = [match['url'] for match in matches]
        
        print(f"Found {len(matches)} matches")
        
        return jsonify({
            "matches_found": len(matches),
            "threshold_used": threshold,
            "reference_face_detected": True,
            "reference_face_confidence": float(best_face.det_score),
            "matches": matches
        })
        
    except Exception as e:
        print(f"Error in face_filter: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port = 3000, debug=True)
