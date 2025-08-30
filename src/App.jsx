import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState([]);
  const [error, setError] = useState("");

  const defaultColors = ["#F0F0F0", "#E1E1E1", "#D2D2D2", "#B9B9B9", "#C0C0C0"];

  // ✅ check input: only letters and spaces allowed
  const isValidInput = (text) => /^[A-Za-z\s]+$/.test(text);

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color} to clipboard!`);
  };

  const handleGenerate = async () => {
    const input = prompt.trim();

    // 🛑 if input empty OR contains symbols/numbers → default
    if (!input || !isValidInput(input)) {
      setColors(defaultColors);
      setError(
        "Invalid input (no symbols/numbers allowed). Showing default colors."
      );
      return;
    }
    

    setLoading(true);
    setColors([]);
    setError("");

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Give me 5 hex colors for: ${prompt}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const resultText = response.data.choices[0].message.content;
      const hexMatches = resultText.match(/#[A-Fa-f0-9]{6}/g);

      if (hexMatches && hexMatches.length > 0) {
        setColors(hexMatches);
      } else {
        setColors(defaultColors);
        setError("No valid hex found. Showing default colors.");
      }
    } catch (error) {
      console.log("Error", error);
      setColors(defaultColors);
      setError("API error. Showing default colors.");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="bg-[#1E1B4B] text-white flex flex-col items-center justify-center px-4 py-10 min-h-screen">
      <div className="border-2 p-3 border-[#5D688A]">
        <div className="border-2 p-3 border-[#F7A5A5]">
          <div className="border-2 p-3 border-[#FFDBB6]">
            <div className="border-2 p-3 border-[#FFDBB6] flex flex-col justify-center align-center">
              <h1 className="text-4xl font-bold mb-4 text-center">
                AI Color Palette
              </h1>

              <input
                type="text"
                className="w-full max-w-md border p-3 rounded bg-[#2A265F] text-white mb-2"
                placeholder="Enter your brand/mood (letters only, e.g. sun, blue, nature)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <button
                onClick={handleGenerate}
                className="bg-[#10B981] max-w-md text-white px-6 py-2 rounded hover:bg-[#059669]"
                disabled={loading}
              >
                {loading ? "Generating ...." : "Generate Palette"}
              </button>

              {/* Error message */}
              {error && <p className="text-red-400 mt-2">{error}</p>}

              {/* result */}
              {colors.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-10">
                  {colors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        onClick={() => copyToClipboard(color)}
                        className="w-20 h-20 rounded shadow-lg transition-all duration-500 ease-in-out transform hover:scale-110"
                        style={{ backgroundColor: color }}
                      ></div>

                      <span>{color}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
