import React from 'react';

const CardOption1 = (item) => {
    return (
      <div
        className="bg-black bg-opacity-50 rounded-xl p-4 shadow-lg flex flex-col items-center text-center space-y-2 border border-teal-300"
      >
        <img
          src={item.icon}
          alt={item.title}
          className="w-12 h-12 rounded-full bg-teal-400 p-1"
        />
        <h2 className="text-white text-lg font-semibold uppercase">
          {item.title}
        </h2>
        <p className="text-sm italic">{item.desc}</p>
      </div>
    );
}

export default CardOption1;
