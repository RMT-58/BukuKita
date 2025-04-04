// import React from "react";
// import { useNavigate } from "react-router";

// const ChatItem = ({ chat }) => {
//   const navigate = useNavigate();

//   const handleChatClick = () => {
//     navigate(`/chats/${chat.id}`);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();

//     if (date.toDateString() === now.toDateString()) {
//       return date.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } else {
//       return date.toLocaleDateString([], { month: "short", day: "numeric" });
//     }
//   };

//   return (
//     <div
//       key={chat.id}
//       onClick={() => handleChatClick(chat.id)}
//       className="block cursor-pointer"
//     >
//       <div className="flex items-center p-3 rounded-md hover:bg-gray-50">
//         <div className="relative">
//           <div className="relative w-12 h-12 rounded-full overflow-hidden">
//             <img
//               src={chat.user.avatar || "/placeholder.svg"}
//               alt={chat.user.name}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           {chat.unreadCount > 0 && (
//             <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00A8FF] rounded-full flex items-center justify-center">
//               <span className="text-xs text-white">{chat.unreadCount}</span>
//             </div>
//           )}
//         </div>

//         <div className="ml-3 flex-1">
//           <div className="flex justify-between">
//             <h3 className="font-medium">{chat.user.name}</h3>
//             <span className="text-xs text-gray-500">
//               {formatDate(chat.lastMessage.createdAt)}
//             </span>
//           </div>
//           <p
//             className={`text-sm truncate ${chat.unreadCount > 0 ? "font-medium" : "text-gray-500"}`}
//           >
//             {chat.lastMessage.text}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatItem;
"use client";
import { useNavigate } from "react-router";

const ChatItem = ({ chat }) => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate(`/chats/${chat.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    // Handle both string and number timestamps
    let date;
    if (typeof dateString === "string") {
      // Try to parse as ISO string first
      date = new Date(dateString);
      // If invalid, try to parse as numeric string
      if (isNaN(date.getTime())) {
        date = new Date(Number.parseInt(dateString));
      }
    } else {
      // Handle numeric timestamp
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Recent";
    }

    const now = new Date();

    // Check if the date is today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div onClick={handleChatClick} className="block cursor-pointer">
      <div className="flex items-center p-3 rounded-md hover:bg-gray-50">
        <div className="relative">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            <img
              src={chat.user.avatar || "/placeholder.svg?height=48&width=48"}
              alt={chat.user.name}
              className="w-full h-full object-cover"
            />
          </div>
          {chat.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00A8FF] rounded-full flex items-center justify-center">
              <span className="text-xs text-white">{chat.unreadCount}</span>
            </div>
          )}
        </div>

        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium">{chat.user.name}</h3>
            <span className="text-xs text-gray-500">
              {formatDate(chat.lastMessage.createdAt)}
            </span>
          </div>
          <p
            className={`text-sm truncate ${chat.unreadCount > 0 ? "font-medium" : "text-gray-500"}`}
          >
            {chat.lastMessage.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
