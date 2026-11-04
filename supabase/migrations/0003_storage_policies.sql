-- Policies do bucket "assets" (Supabase Storage). Um bucket público só
-- libera LEITURA sem policy (via /object/public/...) — upload/update/delete
-- exigem policy própria em storage.objects mesmo assim.
--
-- Escopo: cada usuário só pode escrever/apagar dentro da sua própria pasta
-- (primeiro segmento do path = auth.uid()), seguindo a convenção usada em
-- lib/actions/assets.ts: `${user.id}/${productId ?? "geral"}/${arquivo}`.

create policy "assets_authenticated_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'assets');

create policy "assets_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "assets_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "assets_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
