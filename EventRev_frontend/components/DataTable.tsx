

interface DataTableProps{
    url : string
    errorMessage: string
}


const DataTable = async ({url, errorMessage} : DataTableProps) => {
    const response = await fetch(url ,{ next:{revalidate : 60},});
    

    if(!response.ok) return <h1>{errorMessage}</h1>

    const data = await response.json();
    if(!Array.isArray(data || data.length === 0)){
        return <p >no valid data</p>
    }

    const keys = Object.keys(data[0]);
    

    return <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
        <thead className="bg-stone-50 dark:bg-stone-800/50">
       <tr>
            {keys.map((key) => <th key={key} className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">{key}</th>)}
        </tr>
        </thead>
 
        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {
                data.map((item:any) => {
                    return <tr className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">{keys.map((key)=> {
                        return <th className="px-6 py-4 whitespace-nowrap">{item?.[key] || '777'}</th>
                    } )}</tr>
                })
            }
        </tbody>
    </table>   
}


export default DataTable;