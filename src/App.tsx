import React, { useEffect } from "react";
import "./App.css";
import { DataTable } from "./data-table";
import { AlertCircle } from "lucide-react";
import { LZString } from "./utils/lz-string";

interface JsonInputProps {
  onDataChange: (data: any[]) => void;
  className?: string;
  defaultInputValue?: string;
}

function decompressData(compressed: string) {
  return JSON.parse(LZString.decompressFromEncodedURIComponent(compressed));
}

const JsonInput: React.FC<JsonInputProps> = ({
  onDataChange,
  className,
  defaultInputValue = "",
}) => {
  const [inputValue, setInputValue] = React.useState(defaultInputValue);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    setInputValue(defaultInputValue);
  }, [defaultInputValue]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (!value.trim()) {
      setError("Please enter some JSON data");
      onDataChange([]);
      return;
    }

    try {
      const parsedData = JSON.parse(value);
      if (!Array.isArray(parsedData)) {
        setError("Input must be an array of objects");
        return;
      }
      if (parsedData.length === 0) {
        setError("Array is empty");
        return;
      }
      if (
        !parsedData.every((item) => typeof item === "object" && item !== null)
      ) {
        setError("All items must be objects");
        return;
      }

      setError(null);
      onDataChange(parsedData);
    } catch (e) {
      setError("Invalid JSON format");
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputValue);
      setInputValue(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // If cannot parse, leave as is
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          JSON Input
        </label>
        <button
          onClick={formatJson}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Format JSON
        </button>
      </div>
      <textarea
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        className={`w-full h-48 p-3 rounded-lg border text-sm font-mono ${
          error
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
        }`}
        placeholder="Paste your JSON array here..."
      />
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};

function App() {
  const [data, setData] = React.useState<any[]>([]);
  // console.log(window.location.search);

  useEffect(() => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const compressedData = params.get("json");

      if (compressedData) {
        setData(decompressData(compressedData));
      }
    }
  }, []);

  console.log(data);

  return (
    <>
      <JsonInput
        onDataChange={setData}
        defaultInputValue={JSON.stringify(data, null, 2)}
        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
      />
      {data.length > 0 && (
        <div className="mt-8">
          <DataTable data={data} />
        </div>
      )}
    </>
  );
}

export default App;
