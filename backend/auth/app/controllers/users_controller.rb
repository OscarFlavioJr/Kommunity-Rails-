class UsersController < ApplicationController
  def create
    user = User.new(user_params)

    if user.save
      render json: {
        message: "User created successfully",
        user: {
          name: user.name,
          email: user.email
        }
      }, status: :created
    else
      render json: {
        message: "User creation failed",
        errors: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end


   def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      render json: {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, status: :ok
    else
      render json: {
        message: "Invalid email or password"
      }, status: :unauthorized
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password)
  end
end
