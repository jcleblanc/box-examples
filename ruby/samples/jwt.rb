require 'boxr'
require 'dotenv' 
require 'openssl'
require 'sinatra'

Dotenv.load("./.envjwt")

get '/start' do
  private_key = OpenSSL::PKey::RSA.new(File.read(ENV['JWT_SECRET_KEY_PATH']), ENV['JWT_SECRET_KEY_PASSWORD'])
  response = Boxr::get_enterprise_token(private_key: private_key)
  client = Boxr::Client.new(response.access_token)

  # Upload file
  folder = client.folder_from_path('/')
  file = client.upload_file('rep_api_example.png', folder)
  updated_file = client.create_shared_link_for_file(file, access: :open)
  puts "Shared Link: #{updated_file.shared_link.url}"

  'start'
end
