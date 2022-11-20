import type { NextApiRequest, NextApiResponse } from 'next'

import formidable from 'formidable';
import Jimp from 'jimp';

const max_width = 150;
const max_height = 150;

const grayscaleAsciiMap = [
    '$','@','B','%','8','&','W','M','#',
    'o','a','h','k','b','d','p','q','w',
    'm','Z','O','0','Q','L','C','J','U',
    'Y','X','z','c','v','u','n','x','r',
    'j','f','t','/','|','(',')','1','{',
    '}','[',']','?','-','_','+','~','<',
    '>','i','!','l','I',';',':',',','\"',
    '^','`','\'','.'
]

const getCharacterForGrayScale = (grayScale: number) => {
    const grayscalePercent = grayScale / 255;
    const index = Math.ceil((grayscaleAsciiMap.length - 1) * grayscalePercent);
    return grayscaleAsciiMap[index];
};

const imageToAscii = (img: Jimp): string => {
    let output = "";

    for (const { x, idx, image } of img.scanIterator(
        0,
        0,
        img.bitmap.width,
        img.bitmap.height
      )) {
        const lightness = image.bitmap.data[idx]!;
        output += getCharacterForGrayScale(lightness);
        if (x == image.bitmap.width-1) {
            output += "\r\n";
        }
    }

    return output;
}

export const convert = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }
        
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, async (_err, _fields, files) => {
            const testImage = files.file as formidable.File;
            const image = (await Jimp.read(testImage.filepath))
            .scaleToFit(max_width, max_height)
            .brightness(-0.5)
            .sepia()
            .dither16()
            .grayscale()
            .contrast(0.35)
            .invert()
            const asciiString = await imageToAscii(image);
            res.status(200).send(asciiString);
        });
    } catch (err) {
        res.status(500).send({ err })
    }
}

export const config = {
    api: {
      bodyParser: false,
    },
  };

export default convert;