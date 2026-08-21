import { History as HistoryIcon } from "lucide-react";

function History() {

  const history = [
    {
      file: "orders.csv",
      type: "CSV",
      records: 4250,
      status: "Completed",
      date: "Today, 10:30 AM",
    },
    {
      file: "customers.json",
      type: "JSON",
      records: 1840,
      status: "Completed",
      date: "Today, 09:45 AM",
    },
    {
      file: "products.xml",
      type: "XML",
      records: 1284,
      status: "Completed",
      date: "Yesterday",
    },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Upload History
        </h1>

        <p className="mt-1 text-slate-500">
          View previously processed datasets.
        </p>
      </div>


      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px] text-left">

            <thead>

              <tr className="border-b text-sm text-slate-500">

                <th className="p-4">
                  File
                </th>

                <th className="p-4">
                  Type
                </th>

                <th className="p-4">
                  Records
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {history.map((item) => (

                <tr
                  key={item.file}
                  className="border-b last:border-0"
                >

                  <td className="p-4 font-semibold">
                    {item.file}
                  </td>

                  <td className="p-4">
                    {item.type}
                  </td>

                  <td className="p-4">
                    {item.records}
                  </td>

                  <td className="p-4">

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {item.status}
                    </span>

                  </td>

                  <td className="p-4 text-slate-500">
                    {item.date}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default History;