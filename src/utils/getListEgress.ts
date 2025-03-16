export async function getListEgress() {
   const res = await fetch("/api/list-egress")
   const data = await res.json()
   return data.egressList
}