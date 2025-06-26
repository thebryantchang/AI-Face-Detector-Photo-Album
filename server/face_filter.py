"""
import face_recognition
import requests
from io import BytesIO
import sys
import json

def load_image_from_url(url):
    try:
        response = requests.get(url)
        return face_recognition.load_image_file(BytesIO(response.content))
    except:
        return None

def find_matching_images(reference_image_url, image_urls, tolerance=0.6):
    matches = []

    ref_image = load_image_from_url(reference_image_url)
    if ref_image is None:
        return []

    ref_encodings = face_recognition.face_encodings(ref_image)
    if not ref_encodings:
        return []

    ref_encoding = ref_encodings[0]

    for url in image_urls:
        target_image = load_image_from_url(url)
        if target_image is None:
            continue
        encodings = face_recognition.face_encodings(target_image)
        for encoding in encodings:
            if face_recognition.compare_faces([ref_encoding], encoding, tolerance=0.4)[0]:
                matches.append(url)
                break

    return matches

if __name__ == "__main__":
    try:
        data = json.loads(sys.stdin.read())
        reference = data["reference"]
        candidates = data["candidates"]
        matches = find_matching_images(reference, candidates)
        print(json.dumps({"matches": matches}))
    except:
        print(json.dumps({"matches": []}))
"""

import face_recognition
import requests
from io import BytesIO
import sys
import json

def load_image_from_url(url):
    try:
        response = requests.get(url, timeout=10)
        return face_recognition.load_image_file(BytesIO(response.content))
    except:
        return None

def find_matching_images(reference_image_urls, image_urls, tolerance=0.4):
    matches = []
    ref_encodings = []

    # Load all reference encodings
    for ref_url in reference_image_urls:
        ref_image = load_image_from_url(ref_url)
        if ref_image is None:
            continue
        encs = face_recognition.face_encodings(ref_image)
        ref_encodings.extend(encs)

    if not ref_encodings:
        return []

    # Match candidate images
    for url in image_urls:
        target_image = load_image_from_url(url)
        if target_image is None:
            continue

        encodings = face_recognition.face_encodings(target_image)
        for encoding in encodings:
            if any(face_recognition.compare_faces(ref_encodings, encoding, tolerance)):
                matches.append(url)
                break  # Skip to next candidate after one match

    return matches

if __name__ == "__main__":
    try:
        data = json.loads(sys.stdin.read())
        reference = data["reference"]
        # Allow both string or list of URLs for backward compatibility
        reference_urls = reference if isinstance(reference, list) else [reference]
        candidates = data["candidates"]
        matches = find_matching_images(reference_urls, candidates)
        print(json.dumps({"matches": matches}))
    except:
        print(json.dumps({"matches": []}))
