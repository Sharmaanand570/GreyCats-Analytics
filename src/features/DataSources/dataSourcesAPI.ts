import api from "@/apiConfig";



export type DataSource = {
success: boolean;
url: string;
}


export const YoutubeConnector = async (): Promise<DataSource> => {
  const response = await api.get<DataSource>("/youtube/connect"); 
    return response.data;
}