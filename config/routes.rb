Rails.application.routes.draw do
  devise_for :users
  namespace :api do
    namespace :v1 do
      devise_scope :user do
        post "users/sign_in", to: "users/sessions#create", as: :user_session
        delete "users/sign_out", to: "users/sessions#destroy", as: :destroy_user_session
        get "users/sessions", to: "users/sessions#index", as: :user_sessions
      end
      resources :assigned_main_tasks do
        resources :assigned_sub_tasks
      end
      resources :mentorships
      namespace :admin do
        resources :users, only: [ :index, :update, :destroy, :create ] do
          collection do
            get "mentors", to: "users#mentors"
            get "mentees", to: "users#mentees"
            get "admins", to: "users#admins"
          end
        end
        resources :main_tasks, only: [ :index, :create, :update, :destroy ] do
          member do
            delete :remove_attachment, to: "main_tasks#remove_attachment"
          end
          resources :sub_tasks, only: [ :index, :create, :update, :destroy ] do
            member do
              delete :remove_attachment
            end
          end
        end
      end
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
