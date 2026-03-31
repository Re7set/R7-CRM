import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export function useTags() {
  const qc = useQueryClient();

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tags').select('*').order('name');
      if (error) throw error;
      return (data ?? []) as Tag[];
    },
  });

  const addTagMut = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data, error } = await supabase.from('tags').insert({ name, color }).select().single();
      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); },
  });

  const deleteTagMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); },
  });

  const addTag = async (name: string, color: string) => {
    const result = await addTagMut.mutateAsync({ name, color });
    return result;
  };

  const deleteTag = async (id: string) => {
    await deleteTagMut.mutateAsync(id);
  };

  return { tags, addTag, deleteTag };
}

export function useDealTags(dealId: string | null) {
  const qc = useQueryClient();

  const { data: tagIds = [] } = useQuery({
    queryKey: ['deal_tags', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase.from('deal_tags').select('tag_id').eq('deal_id', dealId);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.tag_id as string);
    },
    enabled: !!dealId,
  });

  const addTagMut = useMutation({
    mutationFn: async (tagId: string) => {
      if (!dealId) return;
      const { error } = await supabase.from('deal_tags').insert({ deal_id: dealId, tag_id: tagId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deal_tags', dealId] }); },
  });

  const removeTagMut = useMutation({
    mutationFn: async (tagId: string) => {
      if (!dealId) return;
      const { error } = await supabase.from('deal_tags').delete().eq('deal_id', dealId).eq('tag_id', tagId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deal_tags', dealId] }); },
  });

  const addTagToDeal = async (tagId: string) => { await addTagMut.mutateAsync(tagId); };
  const removeTagFromDeal = async (tagId: string) => { await removeTagMut.mutateAsync(tagId); };

  return { tagIds, addTagToDeal, removeTagFromDeal };
}
