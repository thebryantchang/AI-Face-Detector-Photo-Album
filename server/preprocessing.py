from pymongo import MongoClient
from bson import ObjectId
from mtcnn import MTCNN
import cv2
import numpy as np
import requests
import io
import insightface


MongoURI = "mongodb+srv://admin:12341234@cluster0.8wyl7.mongodb.net/"
client = MongoClient(MongoURI)

db = client["test"]
imagescollection = db["images"]
facescollection = db["faces"]

#connecting to MongoCluster, under client of test and collection of faces
model = insightface.app.FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
model.prepare(ctx_id=0)
detector = MTCNN()
images = list(imagescollection.find({})) #found all images in the collection
for image in images:
    image_url = image['url']  # Get the URL of the image
    resp = requests.get(image_url)
    img_arr = np.asarray(bytearray(resp.content), dtype=np.uint8)
    img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Use InsightFace for both detection and embedding
    try:
        # InsightFace expects BGR format for the full image
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        faces_analysis = model.get(img_bgr)
        confident_faces = [face for face in faces_analysis if face.det_score > 0.6]  
        print(f"Found {len(confident_faces)} faces with embeddings in image {image['url']}")
        
        
        for i, face in enumerate(confident_faces):
            # Get bounding box from InsightFace
            bbox = face.bbox.astype(int)
            x1, y1, x2, y2 = bbox
            
            # Check if this face already exists for this image
            existing_face = facescollection.find_one({
                "image_id": image['_id'],
                "box": [int(x1), int(y1), int(x2), int(y2)]
            })
            
            if existing_face:
                print(f"Face {i} already exists for image {image['url']}, skipping...")
                continue
            
            # Get embedding directly from InsightFace
            embedding = face.embedding.tolist()
            
            doc = {
                "image_id": image['_id'],
                "url": image['url'],
                "embedding": embedding,
                "box": [int(x1), int(y1), int(x2), int(y2)],  # Convert numpy.int64 to Python int
                "confidence": float(face.det_score)  # Detection confidence from InsightFace
            }
            
            try:
                result = facescollection.insert_one(doc)
                print(f"Inserted face {i} with embedding for image {image['url']}, ID: {result.inserted_id}")
            except Exception as insert_error:
                print(f"Error inserting face {i} for image {image['url']}: {insert_error}")
                continue
            
    except Exception as e:
        print(f"Error processing image {image['url']}: {e}")
        continue





"""
doc = {
    "name": "example_face",
    "description": "This is just a test document."
}

result = collection.insert_one(doc)
print(f"Document inserted with ID: {result.inserted_id}")
"""
#testing insert document

"""
import boto3

bucket_name = "aifacedetector"
region = "ap-southeast-1"

s3 = boto3.client('s3', aws_access_key_id="AKIAU2OSFR46F6EY7JMU", aws_secret_access_key="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", region_name=region)


response = s3.list_objects_v2(Bucket=bucket_name)

if 'Contents' in response:
    for obj in response['Contents']:
        key = obj['Key']
        url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{key}"
        print(url)
else:
    print("Bucket is empty or does not exist")

"""

#aws stuff