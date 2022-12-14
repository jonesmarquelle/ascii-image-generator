import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Home: NextPage = () => {
  const [imageFile, setImageFile] = useState<File>()
  const [asciiImage, setAsciiImage] = useState("");
  
  const getCurrentTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files
    if (inputFiles && inputFiles.length !== 0) {
      setImageFile(inputFiles[0]);
    } else {
      resetImage();
    }
    e.target.value = '';
  }

  const resetImage = () => {
    setImageFile(undefined);
    setAsciiImage("");
  }

  const uploadSampleImage = () => {
    fetch("/bill_original.png")
    .then(res => res.blob())
    .then(blob => {
      setImageFile(blob as File)
    })
  }

  const fetchAscii = () => {
    if (!imageFile) return

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('invert', getCurrentTheme().toString());

    fetch('/api/convert', {
      method: 'POST',
      body: formData,
    })
    .then( async (res) => {
      const asciiString = await res.text();
      setAsciiImage(asciiString);
    });
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col">
        <div className="flex min-w-screen justify-end m-5">
          <Link href="https://github.com/jonesmarquelle">
            <picture className="w-8 md:w-12 aspect-square">
              <source srcSet="/github-logo-dark-64x.png" media="(prefers-color-scheme: dark)" />
              <img src="/github-logo-64x.png" alt="Github Link" />
            </picture>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl w-full text-center">
            Image-To-Ascii Generator
          </h1>
          <div className="w-screen max-h-screen flex flex-col md:flex-row gap-10 p-20 items-center">
            <div className="flex flex-col w-full items-center">
                <label className="flex w-full lg:w-3/4 items-center justify-center cursor-pointer">
                  <input className="hidden" type="file" onChangeCapture={onUpload} onClick={resetImage} accept=".png,.jpg,.jpeg,.bmp"/>
                  {imageFile ? ( 
                      <Image
                        className="w-full" 
                        src={URL.createObjectURL(imageFile)} 
                        alt="uploaded image"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <span className="w-full flex aspect-square text-3xl font-thin text-center justify-center items-center rounded-xl border-slate-400 border-4 border-dashed">
                        Select Image
                      </span>
                    )
                  }
                </label>
            </div>
            
            <div className="flex flex-col min-w-fit items-center justify-center gap-3">
            <button 
              className="text-lg text-neutral-200 font-thin rounded-xl text-center bg-indigo-800 hover:bg-indigo-900 px-5 py-1"
              onClick={fetchAscii}>
              Convert File
            </button>
            <button 
              className="text-base text-neutral-200 font-thin rounded-xl text-center bg-indigo-800 hover:bg-indigo-900 px-5 py-1"
              onClick={uploadSampleImage}>
              Load Sample Image
            </button>
            </div>
            
            <div className="flex flex-col w-full items-center">
              {asciiImage ? (
                <h3 className="font-['Courier'] whitespace-pre tracking-[0.3em] leading-[0.2rem] text-[0.2rem] text-black dark:text-white flex w-full  lg:w-3/4 aspect-square  text-center justify-center items-center">
                  {asciiImage}
                </h3>
              ) : (
                <h3 className="flex w-full text-3xl font-thin lg:w-3/4 aspect-square rounded-xl text-center justify-center items-center border-slate-400 border-4 border-dashed">
                  Output Image
                </h3>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
