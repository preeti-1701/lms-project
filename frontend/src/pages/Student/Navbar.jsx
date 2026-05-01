export default function Navbar() {
    return (
      <div className="fixed top-0 left-64 right-0 z-50 bg-[#020617]/90 backdrop-blur-md flex justify-end items-center px-6 py-3 shadow-md">
        
        {/* 🌙 Theme button */}
        <button className="bg-gray-800 px-3 py-1 rounded hover:bg-gray-700">
          🌙
        </button>
  
        {/* 👤 User */}
        <div className="ml-4 bg-gray-800 px-4 py-1 rounded hover:bg-gray-700 cursor-pointer">
          Sharath
        </div>
      </div>
    );
  }