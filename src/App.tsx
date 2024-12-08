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
  defaultInputValue = `
    [
  {
    "id": 1,
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.j@email.com",
    "age": 32,
    "address": {
      "street": "456 Maple Avenue",
      "city": "Portland",
      "state": "OR",
      "zipCode": "97201"
    },
    "phoneNumber": "503-555-0123",
    "occupation": "Software Engineer",
    "joined": "2023-03-15",
    "isActive": true,
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en-US"
    }
  },
  {
    "id": 2,
    "firstName": "Michael",
    "lastName": "Chen",
    "email": "mchen@email.com",
    "age": 28,
    "address": {
      "street": "789 Oak Street",
      "city": "Austin",
      "state": "TX",
      "zipCode": "78701"
    },
    "phoneNumber": "512-555-0456",
    "occupation": "Data Analyst",
    "joined": "2023-06-22",
    "isActive": true,
    "preferences": {
      "theme": "light",
      "notifications": false,
      "language": "en-US"
    }
  },
  {
    "id": 3,
    "firstName": "Emma",
    "lastName": "Rodriguez",
    "email": "emma.r@email.com",
    "age": 35,
    "address": {
      "street": "123 Pine Lane",
      "city": "Seattle",
      "state": "WA",
      "zipCode": "98101"
    },
    "phoneNumber": "206-555-0789",
    "occupation": "Product Manager",
    "joined": "2022-11-30",
    "isActive": true,
    "preferences": {
      "theme": "auto",
      "notifications": true,
      "language": "es-ES"
    }
  },
  {
    "id": 4,
    "firstName": "James",
    "lastName": "Wilson",
    "email": "jwilson@email.com",
    "age": 41,
    "address": {
      "street": "321 Birch Road",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60601"
    },
    "phoneNumber": "312-555-0321",
    "occupation": "Marketing Director",
    "joined": "2023-01-15",
    "isActive": false,
    "preferences": {
      "theme": "light",
      "notifications": true,
      "language": "en-GB"
    }
  },
  {
    "id": 5,
    "firstName": "Aisha",
    "lastName": "Patel",
    "email": "aisha.p@email.com",
    "age": 29,
    "address": {
      "street": "567 Cedar Court",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105"
    },
    "phoneNumber": "415-555-0654",
    "occupation": "UX Designer",
    "joined": "2023-09-01",
    "isActive": true,
    "preferences": {
      "theme": "dark",
      "notifications": false,
      "language": "en-US"
    }
  }
]
  `,
}) => {
  const [inputValue, setInputValue] = React.useState(defaultInputValue);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    setInputValue(defaultInputValue);
    try {
      const parsedData = JSON.parse(defaultInputValue);
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

  useEffect(() => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const compressedData = params.get("json");

      if (compressedData) {
        setData(decompressData(compressedData));
      }
    }
  }, []);

  return (
    <>
      <JsonInput
        onDataChange={setData}
        defaultInputValue={
          data.length > 0 ? JSON.stringify(data, null, 2) : undefined
        }
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
