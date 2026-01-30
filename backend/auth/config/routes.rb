Rails.application.routes.draw do
  post "/create", to: "users#create"
  post "/login", to: "users#login"
end
