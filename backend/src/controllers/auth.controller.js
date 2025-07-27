import bcrypt from "bcryptjs";
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken"


export const register= async(req,res)=>{
    const {email,password,name}=req.body;

    try{
const existingUser= await db.user.findUnique({
    where:{
        email
    }
})
if(existingUser){
    return res.status(400).json({
        error:"User Already Exists"
    })
}
const hashedPassword=await bcrypt.hash(password,10);
const newUser= await db.user.create({
    data:{
        email,
        password:hashedPassword,
        name,
        role:UserRole.USER
    }
})
const token=jwt.sign({
    id:newUser.id
},process.env.JWT_SECRET,{
    expiresIn:"7d"
})

res.cookie("jwt",token,{
    httpOnly:true,
    sameSite:"strict",
    secure:process.env.NODE_ENV !=="development",
    maxAge:7*24*60*60*1000
})

res.status(201).json({
    success:true,
    message:"User created successfully",
    user:{
        id:newUser.id,
        email:newUser.email,
        name:newUser.name,
        role:newUser.role,
        image:newUser.image
    }
})


    }

    catch(error){
console.error("error creating user:",error)
res.status(500).json({
    error:"error creaing user"
})
    }
    

}
export const login = async(req,res)=>{
    const {email,password}=req.body;
    try{
const user =await db.user.findUnique({
    where:{
        email 

    }
})
if(!user){
    res.status(404).json({
        "message":"user not found"
    })
}
const isMatched=await bcrypt.compare(password,user.password)
if(!isMatched){
    res.status(401).json({
        "error":"Invalid Credintials"
    })
}
const token=jwt.sign({
    id:user.id
},process.env.JWT_SECRET,{
    expiresIn:"7d"
})
res.cookie("jwt",token,{
    httpOnly:true,
    sameSite:"strict",
    secure:process.env.NODE_ENV!="development",
    maxAge:1000*60*60*24*7
})
res.status(201).json({
    success:true,
    message:"User Logged in Succesfully",
    user:{
        id:user.id,
        email:user.email,
        name:user.name,
        role:user.role,
        image:user.image
    }
})

    }
      catch(error){
        console.error("Error loggin Users",error)
res.status(500).json({
    error:"Error logggin  Users"
})
    }
    

}

export const logout=async(req,res)=>{
    try {
        res.clearCookie("jwt",{
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV!="development"

        })
        res.status(201).json({
            success:true,
            message:"user logged out succesfully"
        })
    } catch (error) {
        console.error("error loggin out user",error)
        res.status(500).json({
            error:"Error loggin out user"
        })
    }

}

export const check=async(req,res)=>{
     
try {
    res.status(200).json({
        success:true,
        message:"User authenticated succesfully",
        user:req.user
    })
    
} catch (error) {
    console.error("Error Checking Users:",error);
    res.status(500).json({
        error:"error checking users"
    })
    
}
}