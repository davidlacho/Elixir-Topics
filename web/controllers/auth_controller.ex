defmodule Discuss.AuthController do
  use Discuss.Web, :controller
  plug Ueberauth

  alias Discuss.User

  def callback(%{assigns: %{ueberauth_auth: %{credentials: %{token: token}, info: %{email: email}}}} = conn, %{"provider" => provider}) do
      sign_in(conn, User.changeset(%User{}, %{token: token, email: email, provider: provider}))
  end

  def signout(conn, _params) do
    conn
    |> configure_session(drop: true)
    |> redirect(to: topic_path(conn, :index))
  end

  defp insert_or_update_user(%{changes: %{email: email}} = changeset) do
    case Repo.get_by(User, %{email: email}) do
      nil ->
        Repo.insert(changeset)
      user ->
        {:ok, user}
    end
  end

  defp sign_in(conn, changeset) do
    case insert_or_update_user(changeset) do
      {:ok, user} ->
        conn
        |> put_flash(:info, "Welcome back!")
        |> put_session(:user_id, user.id)
        |> redirect(to: topic_path(conn, :index))
      {:error, _reason} ->
        conn
        |> put_flash(:error, "Something went wrong signing in.")
        |> redirect(to: topic_path(conn, :index))
    end
  end

end
