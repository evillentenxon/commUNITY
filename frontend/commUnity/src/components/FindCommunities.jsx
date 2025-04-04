import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FIndCommunities(props) {
  const [top10, setTop10] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const top10Communities = async () => {
      try {
        const response = await axios.get("http://localhost:4000/users/top10", {
          withCredentials: true,
        });

        if (response.status === 200) {
          setTop10(response.data);
          // console.log(response.data);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "community couldn't be fetched";
        console.log(error);
        toast.error(errorMessage);
      }
    };
    top10Communities();
  }, []);

  const handleClick = (communityId) => {
    navigate("/community/explore", { state: { communityId } });
  };

  return (
    <>
      <div className="font-primary">
        <Toaster />

        {top10.length > 0 && props.display && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 text-center md:text-left md:pl-8 mt-20">
              Recommended Communities for You
            </h1>
            <hr className="h-0.5 bg-gradient-to-r from-blue-500 to-green-500 border-none w-[calc(100%-3rem)] mx-auto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mt-5">
              {top10.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-lg rounded-lg overflow-hidden p-5 border border-gray-200 w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Community Image */}
                  <img
                    src={item.image}
                    alt="community_profile"
                    className="w-full h-44 object-cover rounded-lg"
                  />

                  {/* Community Details */}
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {item.name}
                    </h2>
                    <p className="text-gray-600 text-sm">{item.location}</p>
                    <p className="mt-2 text-gray-700 line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Explore Button */}
                  <button
                    onClick={() => handleClick(item._id)}
                    className="mt-4 w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-700 hover:scale-105"
                  >
                    Explore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FIndCommunities;
