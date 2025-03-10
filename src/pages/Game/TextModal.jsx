import React from "react";

function Modal({ text, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[90vw] h-[90vh] flex flex-col">
        <h2 className="text-4xl font-bold mb-6 text-center">Text Content</h2>

        {/* Scrollable Content */}
        <div className="text-gray-900 text-3xl overflow-y-auto flex-1 p-4">
          {text}
        </div>

        <button
          className="mt-6 bg-red-500 text-white px-8 py-4 text-2xl rounded-xl hover:bg-red-600 self-center"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Modal;
