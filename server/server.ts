import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import Image from './models/image';
import {spawn} from 'child_process'

const categories = ["day-one", "awards", "networking"];

// Randomly choose 1 to 2 categories
function getRandomCategories() {
  const shuffled = categories.sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 categories
  return shuffled.slice(0, count);
}

//connect to mongoose
const mongoURI = "mongodb+srv://admin:12341234@cluster0.8wyl7.mongodb.net/test"
mongoose.connect(mongoURI).then(()=>console.log("successfully connected to mongoDB"))

//to get the AWS S3 images
const BUCKET_NAME = "aifacedetector";
const REGION = "ap-southeast-1";

//  Replace with your actual AWS credentials (ONLY FOR TESTING!)
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: "AKIAU2OSFR46F6EY7JMU", //change later
    secretAccessKey: "gOAo6zgSJD+LdA1W4KhcJZafQY5stw0fexq3/fVR" //hide later
  }
});

async function listImages() {
  const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });

  try {
    const response = await s3.send(command);
    const imageUrls = await (response.Contents || [])
      .filter(obj => obj.Key?.match(/\.(jpg|jpeg|png|gif)$/i))
      .map(obj => `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${obj.Key}`);

    // console.log("Image URLs:");
    // console.log(imageUrls);
    return imageUrls;
  } catch (err) {
    console.error("Error listing objects:", err);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/facefilter', (req,res)=>{
  const { reference, candidates } = req.body;

  // const python = spawn('python3', ['face_filter.py']); // adjust path if needed
  const python = spawn("/opt/anaconda3/bin/python", ["face_filter.py"]);

  const input = JSON.stringify({ reference, candidates });
  let result = '';

  python.stdin.write(input);
  python.stdin.end();

  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on('close', (code) => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed.matches);
    } catch {
      res.status(500).json({ error: 'Failed to parse Python output' });
    }
  });
})

app.get('/api/loadimages',async(req,res)=>{
    try{
        const imageURLs = await listImages()
        
        for(const url of imageURLs){
          const exist = await Image.findOne({url})

          if(!exist){
            const newImage = new Image({
              url:url,
              categories:getRandomCategories(),
            })
            await newImage.save()
            console.log(`saved image with url ${url}`)
          }
        }
        res.json(imageURLs)

    }catch(err){
        res.status(500).json({ error: "Failed to load images" });
    }
    
})

app.get('/api/categories/:id',async(req,res)=>{
    try{
        let filteredImages = []
        if(req.params.id == "all"){
          filteredImages = await Image.find().select('url -_id')
        }else{
          filteredImages = await Image.find({categories: req.params.id}).select('url -_id')
        }
        
        const urls = filteredImages.map(img => img.url);

        res.json(urls)
    }catch(err){
        console.error("Error fetching image URLs:", err);
        res.status(500).json({ error: 'Failed to fetch image URLs' });
    }

})


//testing mongoDB here

app.get('/api/test', (_req, res) => {
    res.json("test succeed");
});

const newImage = new Image({
    url: "https://aifacedetector.s3.ap-southeast-1.amazonaws.com/FAI_2568 (framed).jpg",
    categories:["day one", "awards"]
})

async function saveImageIfNotExists() {
  const url = "https://aifacedetector.s3.ap-southeast-1.amazonaws.com/FAI_2568 (framed).jpg";
  const exist = await Image.findOne({ url });

  if (!exist) {
    const newImage = new Image({
      url,
      categories: ["day one", "awards"]
    });

    newImage.save()
      .then(doc => console.log("post saved:", doc))
      .catch(err => console.error(err));
  } else {
    console.log("duplicate rejected");
  }
}

// saveImageIfNotExists();


//until here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server now running on port ${PORT}`);
});
