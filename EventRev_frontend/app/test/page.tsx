import DataTable from "@/components/DataTable"

const page = () => {
  return (
    <DataTable  url="https://jsonplaceholder.typicode.com/todos" errorMessage="There is an error message on todos call"/>
  )
}

export default page