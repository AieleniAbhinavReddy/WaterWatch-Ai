import React from "react";
import { Inbox } from "lucide-react";

function ComplaintList({ complaints = [] }) {
  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Inbox size={40} className="mb-3" />
        <p className="text-sm font-medium">No complaints yet</p>
        <p className="text-xs">Reported issues will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 text-left font-semibold">Title</th>
            <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">
              Description
            </th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {complaints.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                {c.title}
              </td>
              <td className="px-4 py-3 text-gray-500 truncate max-w-xs hidden sm:table-cell">
                {c.description || "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    c.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : c.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(c.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintList;
