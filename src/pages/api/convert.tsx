import type { NextApiRequest, NextApiResponse } from 'next'

import formidable from 'formidable';
import Jimp from 'jimp';

const max_width = 120;
const max_height = 120;

/*
const extendedGrayscaleAsciiMap = [
    '$','@','B','%','8','&','W','M','#',
    'o','a','h','k','b','d','p','q','w',
    'm','Z','O','0','Q','L','C','J','U',
    'Y','X','z','c','v','u','n','x','r',
    'j','f','t','/','|','(',')','1','{',
    '}','[',']','?','-','_','+','~','<',
    '>','i','!','l','I',';',':',',','\"',
    '^','`','\'','.'
]
*/

const grayscaleAsciiMap = ['@','8','0','G','C','L','f','t','1','i',';',':',',','.',' '];

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
    return new Promise<string>((resolve, reject) => {
        try {
            const form = new formidable.IncomingForm();
            form.parse(req, async (_err, fields, files) => {
                const invert: boolean = fields.invert === 'true';
                const testImage = files.file as formidable.File;
                let image = (await Jimp.read(testImage.filepath))
                .scaleToFit(max_width, max_height)
                .grayscale()
                
                if (invert) {
                    image = image
                    .brightness(-0.1)
                    .contrast(0.1)
                    .invert()
                } else {
                    image = image
                    .brightness(0.23)
                    .contrast(0.5)
                }

                const asciiString = imageToAscii(image);
                res.status(200).send(asciiString);
                resolve(asciiString);
            });
        } catch (err) {
            res.status(500).send({ err })
            reject(err);
        }
    });

}

export const config = {
    api: {
      bodyParser: false,
    },
  };

export default convert;