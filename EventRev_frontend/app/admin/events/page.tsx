import DataTable from "@/components/DataTable"

export const dynamic = 'force-dynamic';

const Events = () => {
  return <DataTable errorMessage="There is an error while retrivng data" url="http://localhost:3000/events" />
}


export default Events;