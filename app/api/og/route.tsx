import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'GDS Training';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0891b2',
                        backgroundImage: 'radial-gradient(circle at center, #0e7490, #164e63)',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        padding: '40px',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '20px',
                            padding: '20px',
                        }}
                    >
                        <span style={{ fontSize: '100px' }}>✈</span>
                    </div>
                    <h1
                        style={{
                            fontSize: '60px',
                            fontWeight: 'bold',
                            margin: '0',
                            lineHeight: '1.2',
                        }}
                    >
                        {title}
                    </h1>
                    <p
                        style={{
                            fontSize: '24px',
                            marginTop: '10px',
                            opacity: '0.8',
                        }}
                    >
                        Professional Airline Reservation & GDS Masterclass
                    </p>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '40px',
                            fontSize: '18px',
                            opacity: '0.6',
                            display: 'flex',
                            gap: '20px',
                        }}
                    >
                        <span>Dhaka, Bangladesh</span>
                        <span>•</span>
                        <span>Amadeus | Sabre | Travelport</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
