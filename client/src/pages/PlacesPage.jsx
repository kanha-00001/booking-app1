import React, { useState,useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";

function PlacesPage() {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [photoByLink, setPhotoByLink] = useState("");

  const [addedPhotos, setAddedPhotos] = useState([]);
  const [uploaded_photos, setUploaded_photos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);
  const { action } = useParams();
  

  useEffect(() => {
    const tokenString = document.cookie.split("; ").find(row => row.startsWith('token='));
    if (tokenString) {
      const token = tokenString.split('=')[1];
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.error("Token not found in cookies.");
      // Handle the case when the token is not found, e.g., redirect to login page
    }
  }, []);
  

  async function add_photo_by_link(ev) {
    ev.preventDefault();
    const { data: filename } = await axios.post("/upload_by_link", {
      link: photoByLink,
    });
    setAddedPhotos((prev) => [...prev, filename]);
    setPhotoByLink("");
  }
  function handlePerks(ev) {
    const { checked, name } = ev.target;
    if (checked) {
      setPerks([...perks, name]);
    } else {
      setPerks(perks.filter((selectedName) => selectedName !== name));
    }
  }
  
  async function addNewPlace(ev) {
    ev.preventDefault();
    const Placedata = {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    };
    const tokenString = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (tokenString) {
      const token = tokenString.split('=')[1];
      try {
        const { data } = await axios.post('/places', Placedata, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setRedirect('/account/places');
      } catch (error) {
        console.error('Error saving place:', error);
      }
    } else {
      console.error('Token not found in cookies.');
    }
  }
  
  if(redirect){
    return <Navigate to={redirect}></Navigate>
  }
  async function uploadPhoto(ev) {
    const files = ev.target.files;
    const datas = new FormData();
    for (let i = 0; i < files.length; i++) {
      datas.append("photos", files[i]);
    }
    const { data: filename } = await axios.post("/uploads", datas, {
      headers: { "content-type": "multipart/form-data" },
    });
    setUploaded_photos((prev) => [...prev, ...filename]);
    console.log(files);
  }
  return (
    <div>
      <div>
        {action !== "new" && (
          <div className="text-center ">
            <Link
              to={"/account/places/new"}
              className="bg-red-500 rounded-full my-2 px-5 py-2 text-bold  inline-flex"
            >
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add New places
            </Link>
          </div>
        )}
      </div>
      my place
      {action === "new" && (
        <div>
          <form className="border-none w-full " onSubmit={addNewPlace}>
            <h2 className="text-2xl mt-4">Title</h2>
            <input
              type="title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              placeholder="Title for place"
            ></input>

            <h2 className="text-2xl mt-4">Adress</h2>
            <input
              type="text"
              value={address}
              onChange={(ev) => setAddress(ev.target.value)}
              placeholder="Write your Adress here"
            ></input>

            <h2 className="text-2xl ">Photos</h2>
            <div className="inline-flex justify-center gap-0">
              <input
                type="text"
                value={photoByLink}
                onChange={(ev) => setPhotoByLink(ev.target.value)}
                placeholder={"Add using a link..."}
              ></input>
              <button
                className="bg-gray-600 w-auto hover:bg-black"
                onClick={add_photo_by_link}
              >
                Add photo
              </button>
            </div>
            <div className=" grid gap-2 grid-cols-3 md:grid-cols-2 lg:grid-cols-3 ">
              {addedPhotos.length > 0 &&
                addedPhotos.map((link, index) => (
                  <div key={index} className="h-32 flex">
                    <img
                      className="rounded-2xl w-full object-cover "
                      src={"http://localhost:4000/uploads/" + link.name}
                      alt={`Upload ${index}`}
                    />
                  </div>
                ))}

              {uploaded_photos.length > 0 &&
                uploaded_photos.map((filename, index) => (
                  <div key={index}>
                    <img
                      className="rounded-2xl w-full object-cover "
                      src={"http://localhost:4000/uploads/" + filename}
                      alt={`Upload ${index}`}
                    />
                  </div>
                ))}
              <label className="border cursor-pointer bg-transparent hover:bg-gray-300 rounded-xl mb-5 text-black  text-3xl flex justify-center items-center px-10 py-10">
                <input type="file" className="hidden" onChange={uploadPhoto} />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                  />
                </svg>
                upload from device
              </label>
            </div>

            <h2 className="text-2xl">Description</h2>
            <textarea
              className="w-full border rounded-xl mb-5 px-2 py-1"
              placeholder="write a few line about the place"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
            ></textarea>

            <h2 className="text-2xl">Perks</h2>
            <p className="text-gray-500 text-sm"> select all the perks </p>

            <div className="inline-flex  w-auto gap-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              <label className="inline-flex border rounded-xl">
                <input
                  type="checkbox"
                  className="w-auto"
                  name="wifi"
                  onChange={handlePerks}
                  
                ></input>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 mt-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
                  />
                </svg>

                <span className="pt-3">Wifi</span>
              </label>

              <label className="inline-flex  border rounded-xl">
                <input
                  type="checkbox"
                  className="w-auto"
                  name="parking"
                  onChange={handlePerks}
                ></input>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 mt-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>

                <span className="pt-3">Parking</span>
              </label>

              <label className="inline-flex  border rounded-xl">
                <input
                  type="checkbox"
                  className="w-auto"
                  name="tv"
                  onChange={handlePerks}

                ></input>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 mt-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>

                <span className="mt-3">Tv</span>
              </label>

              <label className="inline-flex  border rounded-xl">
                <input
                  type="checkbox"
                  className="w-auto"
                  name="pets"
                  onChange={handlePerks}

                ></input>
                <span className="mt-2">Pets</span>
              </label>


              <label className="inline-flex  border rounded-xl">
                <textarea
                  name=""
                  id=""
                  placeholder="others please mention"
                ></textarea>
              </label>
            </div>

            <div className="inline-flex my-5">
              <h2 className="text-2xl mt-4">Check-in Time</h2>
              <input
                type="time"
                value={checkIn}
                onChange={(ev) => setCheckIn(ev.target.value)}
                className="w-auto mr-20"
              ></input>

              <h2 className="text-2xl mt-4">Check-out Time </h2>
              <input
                type="time"
                value={checkOut}
                onChange={(ev) => setCheckOut(ev.target.value)}
                className="w-auto"
              ></input>

              <h2 className="text-2xl mt-4">Max Guests</h2>
              <input
                type="number"
                value={maxGuests}
                onChange={(ev) => setMaxGuests(ev.target.value)}
                className="w-auto px-2"
              ></input>
            </div>

            <h2 className="text-2xl">Extra info</h2>
            <textarea
              className="border-2 border-black-300 rounded-2xl w-full px-5 py-2"
              value={extraInfo}
              onChange={(ev) => setExtraInfo(ev.target.value)}
            ></textarea>

            <button>Save</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PlacesPage;
