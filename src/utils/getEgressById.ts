import { IRecording } from '../app/recordings/page'
import { getListEgress } from './getListEgress'

export async function getEgressById(id: string) {
    try {
        const egressList = (await getListEgress()) as IRecording[]
        const egress = egressList.filter(
            (egress: IRecording) => egress.egressId === id
        )[0]
        return egress
    } catch (e) {
        console.log(e)
        return null
    }
}
