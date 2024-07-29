require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const Multer = require("multer");
const { PrismaClient } = require('@prisma/client');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res;
  }

const prisma = new PrismaClient();
const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});


const app = express();
app.use(cors());

app.post("/upload", upload.single("image"), async (req, res) => {
    const {name,age,div}=req.body
  try {

    if(req.file)
    {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    var cldRes = await handleUpload(dataURI);
    console.log(cldRes)
    }

    photoUrl=cldRes?cldRes.url:null

    const add=await prisma.student.create({data:{name,age:parseInt(age),div,photoUrl}})
    
    res.status(200).json({message:"Added Successfully",photoUrl});
  } catch (error) {
    console.log(error);
    res.json({
      message: error.message,
    });
  }
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server Listening on ${port}`);
});
