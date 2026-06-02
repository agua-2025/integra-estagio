import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedAreas = [
  "/coordenadoria",
  "/instituicao",
  "/unidade",
  "/estagiario",
];

function isProtectedPath(pathname: string) {
  return protectedAreas.some(
    (area) => pathname === area || pathname.startsWith(`${area}/`),
  );
}

function canAccessPath(role: string, pathname: string) {
  if (role === "admin") {
    return true;
  }

  if (role === "coordenadoria") {
    return (
      pathname.startsWith("/coordenadoria") ||
      pathname.startsWith("/instituicao") ||
      pathname.startsWith("/unidade") ||
      pathname.startsWith("/estagiario")
    );
  }

  if (role === "instituicao") {
    return pathname.startsWith("/instituicao");
  }

  if (role === "unidade") {
    return pathname.startsWith("/unidade");
  }

  if (role === "estagiario") {
    return pathname.startsWith("/estagiario");
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isProtectedPath(pathname)) {
    return response;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("erro", "perfil");

    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessPath(profile.role, pathname)) {
    const accessUrl = request.nextUrl.clone();
    accessUrl.pathname = "/acesso";
    accessUrl.searchParams.set("negado", "1");

    return NextResponse.redirect(accessUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
