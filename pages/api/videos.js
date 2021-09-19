// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { IncomingForm, Fields, Files } from 'formidable';
import {
  handleCloudinaryDelete,
  handleCloudinaryUpload,
  handleGetCloudinaryUploads,
} from '../../lib/cloudinary';

// Custom config for our API route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      try {
        const result = await handleGetRequest();

        return res.status(200).json({ message: 'Success', result });
      } catch (error) {
        return res.status(400).json({ message: 'Error', error });
      }
    }

    case 'POST': {
      try {
        const result = await handlePostRequest(req);

        return res.status(200).json({ message: 'Success', result });
      } catch (error) {
        return res.status(400).json({ message: 'Error', error });
      }
    }

    case 'DELETE': {
      try {
        const { id } = req.query;

        if (!id) {
          throw 'id param is required';
        }

        const result = await handleDeleteRequest(id);

        return res.status(200).json({ message: 'Success', result });
      } catch (error) {
        return res.status(400).json({ message: 'Error', error });
      }
    }

    default: {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  }
}

const handleGetRequest = () => handleGetCloudinaryUploads();

const handlePostRequest = async (req) => {
  // Get the form data using the parseForm function
  const data = await parseForm(req);

  // This will store cloudinary upload results for all videos subsequent to the first
  const uploadedVideos = [];

  // Upload result for all videos joined together
  let finalVideoUploadResult;

  // Get the video files and reverse the order
  const videoFiles = data.files.videos.reverse();

  // Loop through all the uploaded videos
  for (const [index, file] of videoFiles.entries()) {
    // Check if it's the last video. In the end result this will actually be the first video
    if (index === data.files.videos.length - 1) {
      // Upload the video to cloudinary, passing an array of public ids for the videos that will be joined together
      const uploadResult = await handleCloudinaryUpload(
        file.path,
        uploadedVideos.map((video) => video.public_id.replace(/\//g, ':'))
      );

      finalVideoUploadResult = uploadResult;
    } else {
      // Upload video to cloudinary
      const uploadResult = await handleCloudinaryUpload(file.path);

      // Add upload result to the start of the array of uploaded videos that will be joined together
      uploadedVideos.unshift(uploadResult);
    }
  }

  return finalVideoUploadResult;
};

const handleDeleteRequest = async (id) => handleCloudinaryDelete([id]);

/**
 *
 * @param {*} req
 * @returns {Promise<{ fields:Fields; files:Files; }>}
 */
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true, multiples: true });

    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject(error);
      }

      return resolve({ fields, files });
    });
  });
};
