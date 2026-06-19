export default function Navbar() {
  function back() {
    history.back();
  }

  return (
    <div class="navbar min-h-16 border-b-2 border-base-300 bg-base-100 px-4 shadow-sm">
      <div class="navbar-start min-w-0 gap-4">
        <img class="hidden h-10 w-auto lg:block" src="/logo.png" alt="Logo" />

        <div class="min-w-0">
          <div class="truncate text-2xl font-black leading-none text-black">
            Monitoreo Kitting
          </div>

          <div class="mt-1 hidden text-sm font-bold text-black/60 md:block">
            Estado de órdenes en tiempo real
          </div>
        </div>
      </div>

      <div class="navbar-center hidden xl:flex">
        <div class="flex items-center gap-2 rounded-full bg-base-200 px-3 py-2">
          <span class="text-sm font-black uppercase text-black/60">
            Prioridad
          </span>

          <div class="badge badge-success badge-md font-black">Baja</div>

          <div class="badge badge-warning badge-md font-black">Media</div>

          <div class="badge badge-error badge-md font-black">Alta</div>
        </div>
      </div>

      <div class="navbar-end gap-2">
        <a href="registry" class="btn btn-primary btn-sm font-black">
          Registro
        </a>

        <button
          type="button"
          class="btn btn-secondary btn-sm font-black"
          onClick={back}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
