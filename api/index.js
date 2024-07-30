require('dotenv').config({ path: '../.env' });
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

app.get("/", async (req,res)=>{
  try
  {
    res.status(200).json({message:"WOW, My API works"})
  }
  catch(err)
  {
    console.log(err)
    res.status(500).json({message:err.message})
  }
})

app.post("/upload", upload.single("image"), async (req, res) => {
    const {heading,caption,languages,url}=req.body
  try {

    if(req.file)
    {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    var cldRes = await handleUpload(dataURI);
    console.log(cldRes)
    }

    image=cldRes?cldRes.url:null
    publicId = cldRes?cldRes.public_id:null
    console.log(publicId)
    console.log(image)

    const item=await prisma.projects.create({data:{heading,caption,languages,url,image,cloudinaryPublicId:publicId}})
    
    res.status(200).json({message:"Added Successfully",item});
  } catch (error) {
    console.log(error);
    res.json({
      message: error.message,
    });
  }
});

// app.get("/student/:id",async (req,res)=>{
//   const {id}
//   try
// })

app.patch("/edit/:id",upload.single("image"),async (req,res)=>{
  const {id}=req.params
  const {heading,caption,languages,url}=req.body
  try
  {
    const item=await prisma.projects.findUnique({where:{id:parseInt(id)}})
    if(req.file)
    {
      console.log("hi")
      if(item.cloudinaryPublicId)
      {
        await cloudinary.uploader.destroy(item.cloudinaryPublicId)
      }
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    var cldRes = await handleUpload(dataURI);
    console.log(cldRes)
    }
    image=cldRes?cldRes.url:item.photoUrl
    publicId = cldRes?cldRes.public_id:item.cloudinaryPublicId
    console.log(publicId)
    const update=await prisma.projects.update({where:{id:parseInt(id)},data:{heading,caption,languages,image,url,cloudinaryPublicId:publicId}})
    res.status(200).json({message:"Edited Successfully"});
  }
  catch(err)
  {
    console.log(err);
    res.status(500).json({message: err.message})
  }

})

app.delete("/delete/:id",async (req,res)=>{
  const {id}=req.params
  try
  {
    const item=await prisma.student.findUnique({where:{id:parseInt(id)}})

    if(item.cloudinaryPublicId)
    {
      await cloudinary.uploader.destroy(item.cloudinaryPublicId)
    }

    await prisma.student.delete({
      where: { id: parseInt(id) },
  });

  res.status(200).json({ message: "Deleted Successfully" });
  }
  catch(err)
  {
    console.log(err);
    res.status(500).json({message: err.message})
  }
})


const port = 3000;
app.listen(port, () => {
  console.log(`Server Listening on ${port}`);
});
