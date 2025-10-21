import { supabase } from "@/lib/supabase";
import type { Client, ClientInsert, ClientUpdate, ProfileUpdate, UploadResponse } from "@/types";
import { useMutation, useQuery } from "@pinia/colada";
import { defineStore } from "pinia";
import { StoragePaths } from "@/lib/storage";
interface ClientStore {
  clients: Client[]
}

export const useClientStore = defineStore('clients', {
  state: (): ClientStore => ({
    clients: []
  }),
  actions: {
    fetchClients() {
      return useQuery({
        key: ['admin', 'clients'],
        query: async () => {
          const { data, error } = await supabase.from('profiles')
            .select('*')
            .eq('role', 'client')
          if (error) throw error
          this.clients = data as Client[]
          return this.clients
        },
        initialData: () => this.clients || []
      })
    },
    async saveClientProfile(client: ClientInsert | ClientUpdate) {
      const { data, error } = client.id
        ? await supabase.from('profiles').update(client).eq('id', client.id).select().single()
        : await supabase.from('profiles').insert(client as ClientInsert).select().single()

      if (error) throw error
      const clientData =data as Client
      if(client.id) this.clients = this.clients.map(client => client.id === clientData.id ? clientData : client)
      else this.clients.push(clientData)

      return clientData;
    },
    async uploadProfilePicture(profileId: string, file: File) {
      const { data, error } = await supabase.storage.from('avatars')
        .upload(StoragePaths.avatar(profileId), file, {
          upsert: true,
        })
        
      if (error) throw error
      const { error: profileError } = await supabase.from('profiles')
        .update({ avatar_url: data.fullPath } as ProfileUpdate)
        .eq('id', profileId)
      if (profileError) throw profileError
      return data as UploadResponse;
    }
  },
  persist: {
    key: 'clients',
    storage: localStorage,

  }

})


