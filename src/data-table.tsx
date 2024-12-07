import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Filter,
  Search,
} from "lucide-react";
import React from "react";

type GenericObject = {
  [key: string]: any;
};

interface DataTableProps<T extends GenericObject> {
  data: T[];
  excludeColumns?: Array<keyof T | string>;
  title?: string;
}

const isDate = (value: any): boolean => {
  const date = new Date(value);
  return (
    value &&
    typeof value === "string" &&
    !isNaN(date.getTime()) &&
    value.includes("/")
  );
};

const BooleanFilter = ({ column }: { column: any }) => {
  const [value, setValue] = React.useState("");

  return (
    <select
      className="w-full rounded-md border border-gray-200 p-2 text-sm"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        column.setFilterValue(
          e.target.value === "" ? undefined : e.target.value === "true"
        );
      }}
    >
      <option value="">All</option>
      <option value="true">Active</option>
      <option value="false">Inactive</option>
    </select>
  );
};

const NumberFilter = ({ column }: { column: any }) => {
  const [min, setMin] = React.useState("");
  const [max, setMax] = React.useState("");

  React.useEffect(() => {
    column.setFilterValue(min || max ? [min, max] : undefined);
  }, [min, max]);

  return (
    <div className="flex gap-2">
      <input
        type="number"
        placeholder="Min"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        className="w-20 rounded-md border border-gray-200 p-2 text-sm"
      />
      <input
        type="number"
        placeholder="Max"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        className="w-20 rounded-md border border-gray-200 p-2 text-sm"
      />
    </div>
  );
};

const TextFilter = ({ column }: { column: any }) => {
  const [value, setValue] = React.useState("");

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        column.setFilterValue(e.target.value || undefined);
      }}
      placeholder={`Filter ${column.id}...`}
      className="w-full rounded-md border border-gray-200 p-2 text-sm"
    />
  );
};

const getFilterComponent = (value: any) => {
  if (typeof value === "boolean") return BooleanFilter;
  if (typeof value === "number") return NumberFilter;
  return TextFilter;
};

function sanitizeColumnId(key: string): string {
  if (!key.trim()) return "empty_column";

  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

function generateUniqueColumnId(key: string, usedIds: Set<string>): string {
  let baseId = sanitizeColumnId(key);
  if (!baseId) baseId = "column";

  let uniqueId = baseId;
  let counter = 1;

  while (usedIds.has(uniqueId)) {
    uniqueId = `${baseId}_${counter}`;
    counter++;
  }

  usedIds.add(uniqueId);
  return uniqueId;
}

function formatHeaderText(key: string): string {
  if (!key.trim()) return "Column";
  return key
    .split(/(?=[A-Z])|_|\s/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}
function generateColumns<T extends GenericObject>(
  data: T[],
  excludeColumns: Array<keyof T | string> = []
): ColumnDef<T>[] {
  if (data.length === 0) return [];

  const sampleObject = data[0];
  const columns: ColumnDef<T>[] = [];
  const usedIds = new Set<string>();

  const allKeys = new Set<string>();

  data.forEach((obj) => {
    Object.keys(obj).forEach((key) => allKeys.add(key));
  });

  const processObject = (obj: any, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (excludeColumns.includes(fullPath)) return;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        processObject(value, fullPath);
      } else {
        const FilterComponent = getFilterComponent(value);
        const uniqueId = generateUniqueColumnId(fullPath, usedIds);
        const displayHeader = formatHeaderText(fullPath);

        columns.push({
          id: uniqueId,
          accessorKey: fullPath,
          header: displayHeader,
          filterFn:
            typeof value === "number" ? "betweenNumberRange" : "includesString",
          Filter: FilterComponent,
          cell: ({ getValue }) => {
            const value = getValue();

            if (value === null || value === undefined || value === "") {
              return <span className="text-gray-400">-</span>;
            }

            if (typeof value === "boolean") {
              return (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    value
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {value ? "Active" : "Inactive"}
                </span>
              );
            }

            if (isDate(value)) {
              return (
                <span className="text-gray-600">
                  {new Date(value as string).toLocaleDateString()}
                </span>
              );
            }

            return (
              <span className="text-gray-900">{value?.toString() ?? ""}</span>
            );
          },
        });
      }
    });
  };

  processObject(sampleObject);
  return columns;
}

export function DataTable<T extends GenericObject>({
  data,
  excludeColumns = [],
  title = "Data Table",
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [showFilters, setShowFilters] = React.useState(false);

  const columns = React.useMemo(
    () => generateColumns<T>(data, excludeColumns),
    [data, excludeColumns]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredRows = table.getRowModel().rows;

  if (!data.length) {
    return (
      <div className="rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              showFilters
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "border-gray-200"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <div className="text-sm text-gray-500">
            {table.getFilteredRowModel().rows.length} of {data.length} items
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        {showFilters && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {table.getAllColumns().map((column) => {
              const FilterComponent = column.columnDef.Filter;
              if (!FilterComponent) return null;

              return (
                <div key={column.id} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {column.columnDef.header as string}
                  </label>
                  <FilterComponent column={column} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="group px-6 py-3 text-left">
                      <button
                        className="flex items-center space-x-2 text-sm font-medium text-gray-900"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span className="text-gray-400">
                          {{
                            asc: <ChevronUp className="h-4 w-4" />,
                            desc: <ChevronDown className="h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                          )}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRows.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No results found for "{globalFilter}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
