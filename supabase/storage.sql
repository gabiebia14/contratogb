
insert into storage.buckets (id, name)
values ('ocr_documents', 'ocr_documents');

insert into storage.policies (bucket_id, name, definition)
values ('ocr_documents', 'Enable read access to all users', '(bucket_id = ''ocr_documents''::text)');
