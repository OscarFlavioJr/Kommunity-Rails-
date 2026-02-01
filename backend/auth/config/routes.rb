Rails.application.routes.draw do
  post "/create", to: "users#create"
  post "/login", to: "users#login"
  post "/logout", to: "users#logout"
end
