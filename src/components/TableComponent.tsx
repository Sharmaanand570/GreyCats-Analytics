import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiInbox } from "react-icons/fi";
import { getStatusBadgeClass } from "../utils/statusColors";

type ClientRow = {
  id?: string | number;
  profile: {
    name: string;
    website: string;
    icon?: string;
  };
  FBLikes: number;
  FBTrend: number;
  GAClicks: number;
  GATrend: number;
};

type IntegrationRow = {
  name: string;
  icon?: string | IconType;
  iconColor?: string;
  link: string;
  label: string;
  status: string | React.ReactNode;
  onDisconnect?: () => void;
  renderActions?: () => React.ReactNode;
};

type ReportRow = {
  id?: string | number;
  name: string;
  created: string;
  onDelete?: () => void;
  // Optional link for the report name
  link?: string;
  disabled?: boolean;
};

type AlertRow = {
  metric: string;
  client: string;
  currentValue: string | number;
  triggerValue: string | number;
  interval: string;
  lastTriggered: string;
};

type ClientDetailRow = {
  metric: string;
  client: string;
  currentValue: string | number;
  triggerValue: string | number;
  interval: string;
  lastTriggered: string;
};

type TableType = {
  header: string[];
  bodyData: (ClientRow | IntegrationRow | ReportRow | AlertRow | ClientDetailRow)[];
  backgroundColor?: string;
  textColor?: string;
};

function TableComponent({ header, bodyData, backgroundColor, textColor }: TableType) {
  // Type guards
  const isIntegrationRow = (row: any): row is IntegrationRow =>
    "label" in row && "link" in row;
  const isClientRow = (row: any): row is ClientRow => "profile" in row;
  const isReportRow = (row: any): row is ReportRow =>
    "name" in row && "created" in row && !("label" in row) && !("profile" in row);
  const isAlertRow = (row: any): row is AlertRow =>
    "metric" in row && "currentValue" in row && "triggerValue" in row && "interval" in row && "lastTriggered" in row;
  const isClientDetailRow = (row: any): row is ClientDetailRow =>
    "metric" in row && "currentValue" in row && "triggerValue" in row && "interval" in row && "lastTriggered" in row && "client" in row;


  const renderIcon = (icon: string | IconType | undefined, name: string, color?: string) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return (
        <img
          src={icon}
          alt={name}
          className="w-5 h-5 rounded-full object-cover"
        />
      );
    }
    const IconComponent = icon as IconType;
    return (
      <IconComponent
        className="w-5 h-5"
        style={color ? { color } : undefined}
      />
    );
  };

  const renderStatusChip = (status: string | React.ReactNode) => {
    if (typeof status !== 'string') {
      return status;
    }

    const colorClass = getStatusBadgeClass(status);

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  if (!bodyData || bodyData.length === 0) {
    return (
      <div className="border w-full rounded-[0.7rem] overflow-hidden" style={{ backgroundColor: backgroundColor || "transparent" }}>
        <div className="h-[78vh] flex items-center justify-center " style={{ color: textColor || "inherit" }}>
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FiInbox className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-1" style={{ color: textColor || "inherit" }}>No data available</p>
            <p className="text-gray-500 text-sm" style={{ color: textColor ? textColor + "cc" : undefined }}>There are no items to display at this time</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border w-full rounded-[0.7rem] overflow-hidden" style={{ backgroundColor: backgroundColor || "transparent" }}>
      <div className="h-[78vh] overflow-auto">
        <table className="w-full table-auto min-w-max">
          <thead className="bg-gradient-to-tr from-[#F3F3F3] to-white border-b sticky top-0 z-10">
            <tr className="text-left uppercase">
              {header.map((h, i) => (
                <th
                  key={h}
                  className={`${i === 0 ? "pl-6" : "pl-2"
                    } pr-6 py-3 font-medium text-sm text-gray-500 whitespace-nowrap`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="">
            {bodyData.map((row, index) => (
              <tr
                key={index}
                className="h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                {/* 🔹 Integration Table */}
                {isIntegrationRow(row) && (
                  <>
                    <td className="pl-6 pr-6 text-sm font-medium text-gray-700 whitespace-nowrap">
                      <Link
                        to={row.link}
                        className="flex items-center gap-2 text-accent-foreground hover:underline"
                      >
                        {renderIcon(row.icon, row.name, row.iconColor)}
                        <span>{row.name}</span>
                      </Link>
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.label}
                    </td>
                    <td>{renderStatusChip(row.status)}</td>
                    {/* Generic Actions or Fallback Disconnect */}
                    {(row.renderActions || row.onDisconnect) && (
                      <td className="text-sm text-left whitespace-nowrap">
                        {row.renderActions ? (
                          row.renderActions()
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              row.onDisconnect?.();
                            }}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Disconnect
                          </button>
                        )}
                      </td>
                    )}
                  </>
                )}

                {/* 🔹 Client Table */}
                {isClientRow(row) && (
                  <>
                    <td className="pl-6 pr-6 whitespace-nowrap">
                      <div className="flex gap-2 items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex justify-center items-center overflow-hidden">
                          {row.profile.icon ? (
                            <img
                              src={row.profile.icon}
                              alt={row.profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium  text-gray-600">
                              {row.profile.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          {row.id ? (
                            <Link
                              to={`/clients/${row.id}`}
                              className="text-sm font-medium text-accent-foreground hover:underline"
                            >
                              {row.profile.name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium">
                              {row.profile.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {row.profile.website}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.FBLikes}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.FBTrend}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.GAClicks}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.GATrend}
                    </td>
                  </>
                )}

                {/* 🔹 Report Table */}
                {isReportRow(row) && (
                  <>
                    <td className="pl-6 pr-6 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {row.id && !row.disabled ? (
                        <Link
                          to={row.link || `/reports/${row.id}`}
                          className="text-accent-foreground hover:underline"
                        >
                          {row.name}
                        </Link>
                      ) : (
                        <span className={`text-sm font-medium ${row.disabled ? 'text-gray-400 cursor-not-allowed' : ''}`}>
                          {row.name}
                          {row.disabled && <span className="ml-2 text-xs italic opacity-70">(Syncing...)</span>}
                        </span>
                      )}
                    </td>
                    <td className={`pl-2 pr-6 text-sm whitespace-nowrap ${row.disabled ? 'text-gray-300' : 'text-gray-600'}`}>
                      {row.created}
                    </td>
                    {row.onDelete && (
                      <td className="pl-2 pr-6 text-sm text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            if (row.disabled) return;
                            e.stopPropagation();
                            row.onDelete?.();
                          }}
                          disabled={row.disabled}
                          className={`text-sm font-medium ${row.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </>
                )}




                {/* 🔹 Alert Table */}
                {isAlertRow(row) && (
                  <>
                    <td className="pl-6 pr-6 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {row.metric}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.client}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.currentValue}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.triggerValue}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.interval}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.lastTriggered}
                    </td>
                  </>
                )}

                {/* 🔹 Client Detail Table */}
                {isClientDetailRow(row) && (
                  <>
                    <td className="pl-6 pr-6 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {row.metric}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.client}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.currentValue}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.triggerValue}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.interval}
                    </td>
                    <td className="pl-2 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {row.lastTriggered}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableComponent;
