require 'boxr'
require 'dotenv' 
require 'sinatra'

Dotenv.load("./.envoauth")

get '/devtoken' do
  client = Boxr::Client.new('ydEKgequYJjbdYaNDgPYyBN3Aescx9Nc')
  items = client.folder_items(Boxr::ROOT)
  items.each {|i| puts i.name}
  'Started server'
end

get '/oauthstart' do
  oauth_url = Boxr::oauth_url(URI.encode_www_form_component('1233'))
  redirect oauth_url
end

get '/oauthreturn' do
  code = params['code']
  state = params['state']
  tokens = Boxr::get_tokens(code)

  client = Boxr::Client.new(tokens.access_token)

  # Upload file
  folder = client.folder_from_path('/')
  file = client.upload_file('taxdoc.txt', folder)
  updated_file = client.create_shared_link_for_file(file, access: :open)
  puts "Shared Link: #{updated_file.shared_link.url}"

  'done'
end
