import { useEffect, useState } from "react";

export function useUpdateEffect(
	effect: React.EffectCallback,
	deps?: React.DependencyList,
) {
	const [isFirstRender, setIsFirstRender] = useState(true);
	useEffect(() => {
		if (isFirstRender) {
			setIsFirstRender(false);
			return;
		}
		return effect();
		// biome-ignore lint/correctness/useExhaustiveDependencies: This is a generic hook to encapsulate useEffect.
	}, deps);
}
