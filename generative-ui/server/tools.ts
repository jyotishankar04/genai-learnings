import { tool } from "langchain"
import { DatabaseSync } from "node:sqlite";
import z, { date } from "zod"


export const initTools = (database: DatabaseSync) => {
    const addExpense = tool(
        ({ title, amount }) => {
            const date = new Date().toISOString().split("T")[0];
            const stmt = database.prepare(`
                INSERT INTO expenses (title, amount, date) VALUES (?, ?, ?)
            `);

            stmt.run(title, amount, date);
            return JSON.stringify({
                status: "success",
                message: "Expense added",
            });
        },
        {
            name: "add_expense",
            description: "add the given expense to database",
            schema: z.object({
                title: z.string().describe("The title of the expense"),
                amount: z.number().describe("The amount of the expense in INR"),
            }),
        }
    );

    const getExpenses = tool(
        ({startDate: startDateString, endDate: endDateString}) => {
            const startDate = new Date(startDateString).toISOString().split("T")[0];
            const endDate = new Date(endDateString).toISOString().split('T')[0];
            const stmt = database.prepare(`
                SELECT * FROM expenses WHERE date BETWEEN ? AND ?
            `)
            const expenses = stmt.all(startDate, endDate);
            console.log("Expenses:", expenses);
            return JSON.stringify(expenses);
        },
        {
            name: "get_expenses",
            description: "get the expenses from database between the given start and end date",
            schema: z.object({  
                startDate: z.string().describe("The start date of the expenses"),
                endDate: z.string().describe("The end date of the expenses"),
            }),
    });

    const generateChart = tool(
        ({startDate: startDateString, endDate: endDateString, groupBy: groupByString}) => {
            const startDate = new Date(startDateString).toISOString().split("T")[0];
            const endDate = new Date(endDateString).toISOString().split("T")[0];
            console.log("Start Date:", startDate);
            console.log("End Date:", endDate);
            console.log("Group By:", groupByString);
            const groupBy = groupByString === "day" ? "strftime('%Y-%m-%d', date)" : groupByString === "week" ? "strftime('%Y-%W', date)" : groupByString === "month" ? "strftime('%Y-%m', date)" : "strftime('%Y', date)";
            const stmt = database.prepare(`
                SELECT ${groupBy} as period, SUM(amount) as total_amount 
                FROM expenses 
                WHERE date 
                BETWEEN ? AND ? 
                GROUP BY period 
                ORDER BY period DESC
            `)
            
            const chart = stmt.all(startDate, endDate);
            const chartData = chart.map((item) => ({
                [groupByString]: item.period,
                amount: item.total_amount,
            }));
            console.log("Chart:", chartData);
            return JSON.stringify(
                {
                    type: "chart",
                    data: chartData,
                    labelBy: groupByString,
                }
            );
        },
        {
            name: "generate_chart",
            description: "generate a chart of the expenses by querying the database between the given start and end date",
            schema: z.object({
                startDate: z.string().describe("The start date of the expenses"),
                endDate: z.string().describe("The end date of the expenses"),
                groupBy: z.enum(["day", "week", "month", "year"]).describe("The group by of the expenses"),

            }),
        }
    );

    return [
        addExpense,
        getExpenses,
        generateChart,
    ];
}
