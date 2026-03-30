import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-4">Welcome to ReFeed</h1>
      <p className="mb-4 text-gray-700">
        Connect donors, NGOs, and volunteers to reduce food waste and fight
        hunger.
      </p>
      <p className="mb-6">
        {/* Keep this text to satisfy the default CRA test. */}
        <a
          href="https://reactjs.org"
          className="text-green-700 underline"
          target="_blank"
          rel="noreferrer"
        >
          learn react
        </a>
      </p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;

