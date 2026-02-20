"use client";

import { Edit2, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    searchPlaceholder?: string;
    loading?: boolean;
}

export default function DataTable<T extends { id: string }>({
    data,
    columns,
    onEdit,
    onDelete,
    searchPlaceholder = "Search...",
    loading = false
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = data.filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="rounded-2xl border border-aviation-100 bg-white shadow-soft overflow-hidden">
            {/* Table Toolbar */}
            <div className="flex items-center justify-between border-b border-aviation-50 p-4">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-xl border border-aviation-100 bg-aviation-50/30 pl-10 pr-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/5 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-ink/40 font-medium">
                        Showing {paginatedData.length} of {filteredData.length} results
                    </span>
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-aviation-50/50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink/50">
                                    {col.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-ink/50">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-aviation-50">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {[...Array(columns.length + 1)].map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-4 w-full rounded bg-aviation-50"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-aviation-50/30 transition-colors group">
                                    {columns.map((col, idx) => (
                                        <td key={idx} className="px-6 py-4 text-sm text-ink/80">
                                            {typeof col.accessor === "function"
                                                ? col.accessor(item)
                                                : (item[col.accessor] as React.ReactNode)}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(item)}
                                                        className="rounded-lg p-2 text-aviation-600 hover:bg-aviation-100 transition-colors"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(item)}
                                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-sm text-ink/40">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-aviation-50 px-6 py-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-aviation-600 disabled:opacity-30 disabled:hover:text-ink/60 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`h-8 w-8 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                                        ? "bg-aviation-600 text-white"
                                        : "text-ink/60 hover:bg-aviation-50"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-aviation-600 disabled:opacity-30 disabled:hover:text-ink/60 transition-colors"
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
