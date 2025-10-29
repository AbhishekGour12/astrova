"use client"
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter()
  useEffect(() =>{
    router.push('/Signup')
  })
  return (
    <>
    
    <Header/>
    

    </>
  );
}
