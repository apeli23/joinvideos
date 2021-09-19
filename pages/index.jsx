import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  /**
   * Holds the selected video files
   * @type {[File[],Function]}
   */
  const [files, setFiles] = useState([]);

  /**
   * Holds the uploading/loading state
   *  @type {[boolean,Function]}
   */
  const [loading, setLoading] = useState(false);

  const [concatenatedVideos, setConcatenatedVideos] = useState([]);

  const getVideos = useCallback(async () => {
    try {
      const response = await fetch(`/api/videos`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      setConcatenatedVideos(data.result.resources);
    } catch (error) {
      // TODO: Show error message to user
      console.error(error);
    } finally {
      // setLoading(false);
    }
  }, []);

  useEffect(() => {
    getVideos();
  }, [getVideos]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Get the form data
      const formData = new FormData(e.target);

      // Post the form data to the /api/videos endpoint
      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      e.target[0].value = "";
      setFiles([]);
      getVideos();
    } catch (error) {
      // TODO: Show error message to user
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      getVideos();
    } catch (error) {
      // TODO: Show error message to user
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Join Videos using Cloudinary and Next.js</title>
        <meta
          name="description"
          content="Join Videos using Cloudinary and Next.js"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="header">
          <h1>Join Videos using Cloudinary and Next.js</h1>
        </div>
        <hr />

        <form className="upload" onSubmit={handleFormSubmit}>
          {files.length > 0 && (
            <ul>
              <b>{files.length} Selected files</b>
              {files.map((file, index) => (
                <li key={`file${index}`}>
                  <p>{file.name}</p>
                </li>
              ))}
            </ul>
          )}

          <label htmlFor="videos">
            <p>
              <b>Select Videos in the order you would like them joined</b>
            </p>
          </label>
          <br />
          <input
            type="file"
            name="videos"
            id="videos"
            accept=".mp4"
            required
            multiple
            disabled={loading}
            onChange={(e) => {
              setFiles([...e.target.files]);
            }}
          />
          <br />
          <button type="submit" disabled={loading || !files.length}>
            Upload Videos
          </button>
        </form>

        {loading && (
          <div className="loading">
            <hr />
            <p>Please be patient as the action is performed...</p>
            <hr />
          </div>
        )}
        <hr />
        <div className="videos-wrapper">
          <h2>Concatenated Videos</h2>
          {concatenatedVideos.map((video, index) => (
            <div className="video-wrapper" key={`video${index}`}>
              <video src={video.secure_url} controls></video>
              <div className="controls">
                <button
                  disabled={loading}
                  onClick={() => {
                    handleDeleteResource(video.public_id);
                  }}
                >
                  Delete Video
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <style jsx>{`
        main {
          background-color: #e5e3ff;
          min-height: 100vh;
        }
        main div.header {
          text-align: center;
          height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        main form {
          display: flex;
          flex-flow: column;
          background-color: #ffffff;
          max-width: 600px;
          margin: auto;
          padding: 20px;
          border-radius: 5px;
        }
        main form button {
          border: none;
          padding: 20px;
          border-radius: 5px;
          font-weight: bold;
          background-color: #ececec;
        }
        main form button:hover:not([disabled]) {
          background-color: #b200f8;
          color: #ffffff;
        }
        main div.loading {
          text-align: center;
        }
        main div.videos-wrapper {
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
        }
        main div.videos-wrapper div.video-wrapper {
          max-width: 1000px;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
          margin: 10px auto;
        }
        main div.videos-wrapper div.video-wrapper video {
          width: 100%;
        }
      `}</style>
    </div>
  );
}