import { theme } from "./theme";

export function Table({
    headers,
    rows,
}: {
    headers: string[];
    rows: (string | number)[][];
}) {
    return (
        <table
            style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 22,
            }}
        >
            <thead>
                <tr>
                    {headers.map((header) => (
                        <th
                            key={header}
                            style={{
                                textAlign: "left",
                                padding: "10px 16px",
                                borderBottom: `2px solid ${theme.color.ink}`,
                                color: theme.color.ink,
                                fontWeight: 600,
                            }}
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i}>
                        {row.map((cell, j) => (
                            <td
                                key={j}
                                style={{
                                    padding: "10px 16px",
                                    borderBottom: `1px solid ${theme.color.divider}`,
                                    color: theme.color.ink,
                                }}
                            >
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
