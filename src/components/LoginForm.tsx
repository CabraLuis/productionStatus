import { useState } from "preact/hooks";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function submit(e: Event) {
    e.preventDefault();
    let response = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ user: formData }),
      headers: { "Content-Type": "application/json" },
    });

    let message = await response.json();
    if (message.message == "CMM") {
      window.location.href = "/cmm/board";
    } else if (message.message == "PRODOPS") {
      window.location.href = "/prodOps";
    } else if (message.message == "PRODSUP") {
      window.location.href = "/prodSup";
    } else if (message.message == "CLEANLINE") {
      window.location.href = "/cleanLine/board";
    }
  }

  return (
    <div>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content flex-col lg:flex-row-reverse">
          <div class="text-center lg:text-left">
            <h1 class="text-5xl font-bold">Iniciar Sesión</h1>
            <p class="py-6">
              Ingresa tus credenciales para ingresar a la plataforma
            </p>
          </div>
          <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
            <form onSubmit={submit} class="card-body">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Nombre de Usuario</span>
                </label>
                <input
                  type="text"
                  placeholder="Ingresa nombre de usuario"
                  class="input input-bordered"
                  required
                  onChange={(e: any) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Contraseña</span>
                </label>
                <input
                  type="password"
                  placeholder="Ingresa contraseña"
                  class="input input-bordered"
                  required
                  onChange={(e: any) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div class="form-control mt-6">
                <button class="btn btn-primary">Iniciar Sesión</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
