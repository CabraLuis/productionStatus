export default function Navbar() {
  function back() {
    history.back();
  }
  return (
    <div class="navbar bg-base-100">
      <div class="navbar-start">
        <a class="btn btn-ghost text-xl">Monitoreo Clean Line</a>
        <img class="hidden lg:block" src="/logo.png" width={"150"} />
      </div>
      <div class="lg:navbar-center lg:flex hidden">
        <div class="badge badge-success">Prioridad Baja</div>
        <div class="badge badge-warning">Prioridad Media</div>
        <div class="badge badge-error">Prioridad Alta</div>
      </div>
      <div class="navbar-end gap-2">
        <a href="registry" class="btn btn-primary">
          Ver Registro
        </a>
        <button class="btn btn-secondary" onClick={back}>
          Volver
        </button>
      </div>
    </div>
  );
}
