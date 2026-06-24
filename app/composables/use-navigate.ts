import type { NuxtLinkProps } from "#app";

type Options = Partial<NuxtLinkProps>;

export function useNavigate() {
  const router = useRouter();

  const navigate = (options: Options) => {
    if (options.external) {
      window.open(options.href as string, "_blank", options.rel || "noopener,noreferrer");
    }
    else {
      router.push(options.to as string);
    }
  };

  return { navigate };
}
