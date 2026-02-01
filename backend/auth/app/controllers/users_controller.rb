class UsersController < ApplicationController
  def create
    user = User.new(user_params)

    if user.save
      token = JwtService.encode(user_id: user.id)

      render json: {
        token: token,
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

    token = JwtService.encode(user_id: user.id)

    if user&.authenticate(params[:password])
      render json: {
        message: "Login successful",
        user: {
          token: token,
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


  def logout
    render json: {message: "Logegd out"}
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password)
  end
end
